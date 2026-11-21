
const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Item = require('./models/item');
const User = require('./models/user');
const Claim = require('./models/claim');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// =====================================
// ENVIRONMENT VARIABLES
// =====================================

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is missing in .env file');
    process.exit(1);
}

// =====================================
// COOKIE OPTIONS
// =====================================

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000
};

// =====================================
// UPLOADS FOLDER
// =====================================

const uploadFolder = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);
}

// =====================================
// MULTER IMAGE UPLOAD
// =====================================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, uploadFolder);
    },

    filename: function (req, file, cb) {

        const uniqueName =
            Date.now() + '-' +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }

});

const upload = multer({

    storage: storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: function (req, file, cb) {

        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/jpg',
            'image/webp'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(
                'Only JPG, JPEG, PNG and WEBP images are allowed.'
            ));
        }

    }

});

// =====================================
// MIDDLEWARE
// =====================================

app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                imgSrc: ["'self'", 'data:', 'blob:']
            }
        }
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadFolder));

// =====================================
// MONGODB CONNECTION
// =====================================

mongoose.connect(process.env.MONGO_URI)

    .then(() => {
        console.log('MongoDB connected successfully!');
    })

    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });

// =====================================
// AUTHENTICATION MIDDLEWARE
// =====================================

function authenticateToken(req, res, next) {

    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: 'Please login first.'
        });
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;
        next();

    } catch (error) {

        return res.status(401).json({
            message: 'Invalid or expired token. Please login again.'
        });

    }
}

// =====================================
// ADMIN AUTHORIZATION
// =====================================

function requireAdmin(req, res, next) {

    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'Access denied. Admin only.'
        });
    }

    next();
}

// =====================================
// REGISTER API
// =====================================

app.post('/api/auth/register', async (req, res) => {

    try {

        const { name, email, studentPRN, password } = req.body;

        if (!name || !email || !studentPRN || !password) {
            return res.status(400).json({
                message: 'Please fill all required fields.'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: 'Password must contain at least 8 characters.'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedPRN = studentPRN.trim();

        const existingUser = await User.findOne({
            $or: [
                { email: normalizedEmail },
                { studentPRN: normalizedPRN }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                message: 'Email or Student PRN already registered.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: name.trim(),
            email: normalizedEmail,
            studentPRN: normalizedPRN,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({
            message: 'Registration successful!'
        });

    } catch (error) {

        console.error('Registration Error:', error);

        res.status(500).json({
            message: 'Registration failed.',
            error: error.message
        });

    }

});

// =====================================
// LOGIN API
// =====================================

app.post('/api/auth/login', async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Please enter email and password.'
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password.'
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: 'Invalid email or password.'
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        );

        res.cookie('token', token, cookieOptions);

        res.status(200).json({
            message: 'Login successful!',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {

        console.error('Login Error:', error);

        res.status(500).json({
            message: 'Login failed.'
        });

    }

});

// =====================================
// LOGOUT API
// =====================================

app.post('/api/auth/logout', (req, res) => {

    res.clearCookie('token', cookieOptions);

    res.status(200).json({
        message: 'Logged out successfully!'
    });

});

// =====================================
// GET LOGGED-IN USER
// =====================================

app.get('/api/auth/me', authenticateToken, async (req, res) => {

    try {

        const user = await User.findById(req.user.userId)
            .select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'User not found.'
            });
        }

        res.status(200).json({
            user: user
        });

    } catch (error) {

        console.error('Current User Error:', error);

        res.status(500).json({
            message: 'Unable to fetch user details.'
        });

    }

});

// =====================================
// REPORT LOST OR FOUND ITEMS API
// LOGIN REQUIRED
// =====================================

app.post(
    '/api/items',
    authenticateToken,

    // Handle Multer errors directly
    (req, res, next) => {

        upload.single('image')(req, res, (error) => {

            if (error) {

                console.error('Image Upload Error:', error.message);

                if (error.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        message: 'Image size must not exceed 5MB.'
                    });
                }

                if (
                    error.message &&
                    error.message.includes('Only JPG, JPEG, PNG and WEBP images are allowed')
                ) {
                    return res.status(400).json({
                        message: 'Only JPG, JPEG, PNG and WEBP images are allowed.'
                    });
                }

                return res.status(400).json({
                    message: error.message
                });

            }

            next();

        });

    },

    async (req, res) => {

        try {

            const newItem = new Item({

                itemType: req.body.itemType,
                itemName: req.body.itemName,
                category: req.body.category,
                description: req.body.description,
                location: req.body.location,
                date: req.body.date,

                image: req.file
                    ? '/uploads/' + req.file.filename
                    : '',

                reportedBy: req.user.userId

            });

            const savedItem = await newItem.save();

            res.status(201).json({
                message: 'Item reported successfully!',
                item: savedItem
            });

        } catch (error) {

            console.error('Error reporting item:', error);

            res.status(400).json({
                message: 'Error reporting item',
                error: error.message
            });

        }

    }
);

// =====================================
// GET ITEMS REPORTED BY LOGGED-IN USER
// =====================================

app.get('/api/my-items', authenticateToken, async (req, res) => {

    try {

        const items = await Item.find({
            reportedBy: req.user.userId
        }).sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Your items fetched successfully!',
            items: items
        });

    } catch (error) {

        console.error('My Items Error:', error);

        res.status(500).json({
            message: 'Unable to fetch your items.'
        });

    }

});

// =====================================
// SUBMIT A CLAIM
// LOGIN REQUIRED
// =====================================


console.log('CLAIM ROUTE REGISTERED');

app.post('/api/claims', authenticateToken, async (req, res) => {

    console.log('CLAIM API ROUTE HIT');

    try {

        const { itemId, claimDescription } = req.body;

        // Check required fields
        if (!itemId || !claimDescription || !claimDescription.trim()) {
            return res.status(400).json({
                message: 'Item ID and claim description are required.'
            });
        }

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({
                message: 'Invalid item ID.'
            });
        }

        // Find item
        const item = await Item.findById(itemId);

        if (!item) {
            return res.status(404).json({
                message: 'Item not found.'
            });
        }

        // Only found items can be claimed
        if (item.itemType !== 'found') {
            return res.status(400).json({
                message: 'You can only claim found items.'
            });
        }

        // Prevent claiming own item
        if (
            item.reportedBy &&
            item.reportedBy.toString() === req.user.userId
        ) {
            return res.status(400).json({
                message: 'You cannot claim your own reported item.'
            });
        }

        // Check duplicate claim
        const existingClaim = await Claim.findOne({
            item: itemId,
            claimedBy: req.user.userId
        });

        if (existingClaim) {
            return res.status(400).json({
                message: 'You have already submitted a claim for this item.'
            });
        }

        // Create new claim
        const newClaim = new Claim({
            item: itemId,
            claimedBy: req.user.userId,
            claimDescription: claimDescription.trim()
        });

        const savedClaim = await newClaim.save();

        res.status(201).json({
            message: 'Claim submitted successfully!',
            claim: savedClaim
        });

    } catch (error) {

        console.error('Submit Claim Error:', error);

        res.status(500).json({
            message: 'Unable to submit claim.',
            error: error.message
        });

    }

});

// =====================================
// GET CLAIMS SUBMITTED BY LOGGED-IN USER
// =====================================

app.get('/api/my-claims', authenticateToken, async (req, res) => {

    try {

        const claims = await Claim.find({
            claimedBy: req.user.userId
        })
            .populate('item')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Your claims fetched successfully!',
            claims: claims
        });

    } catch (error) {

        console.error('My Claims Error:', error);

        res.status(500).json({
            message: 'Unable to fetch your claims.'
        });

    }

});

// =====================================
// GET ALL ITEMS
// =====================================

app.get('/api/items', async (req, res) => {

    try {

        const items = await Item.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Items fetched successfully!',
            items: items
        });

    } catch (error) {

        console.error('Get Items Error:', error);

        res.status(500).json({
            message: 'Unable to fetch items.'
        });

    }

});

// =====================================
// ADMIN: GET DASHBOARD STATISTICS
// =====================================

app.get(
    '/api/admin/stats',
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const totalItems = await Item.countDocuments({});
            const lostItems = await Item.countDocuments({ itemType: 'lost' });
            const foundItems = await Item.countDocuments({ itemType: 'found' });
            const pendingClaims = await Claim.countDocuments({ status: 'pending' });

            res.status(200).json({
                message: 'Admin statistics fetched successfully!',
                stats: {
                    totalItems,
                    lostItems,
                    foundItems,
                    pendingClaims
                }
            });

        } catch (error) {

            console.error('Admin Statistics Error:', error);

            res.status(500).json({
                message: 'Unable to fetch admin statistics.'
            });

        }

    }
);

// =====================================
// ADMIN: GET ALL REPORTED ITEMS
// =====================================

app.get(
    '/api/admin/items',
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const items = await Item.find()
                .populate('reportedBy', 'name email studentPRN')
                .sort({ createdAt: -1 });

            res.status(200).json({
                message: 'All items fetched successfully!',
                items
            });

        } catch (error) {

            console.error('Admin Items Error:', error);

            res.status(500).json({
                message: 'Unable to fetch reported items.'
            });

        }

    }
);

// =====================================
// ADMIN: GET ALL STUDENT CLAIMS
// =====================================

app.get(
    '/api/admin/claims',
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const claims = await Claim.find()
                .populate('item')
                .populate('claimedBy', 'name email studentPRN')
                .sort({ createdAt: -1 });

            res.status(200).json({
                message: 'All claims fetched successfully!',
                claims
            });

        } catch (error) {

            console.error('Admin Claims Error:', error);

            res.status(500).json({
                message: 'Unable to fetch student claims.'
            });

        }

    }
);

// =====================================
// ADMIN: APPROVE OR REJECT CLAIM
// =====================================

app.patch(
    '/api/admin/claims/:id',
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            const { status } = req.body;

            if (!['approved', 'rejected'].includes(status)) {
                return res.status(400).json({
                    message: 'Invalid claim status.'
                });
            }

            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    message: 'Invalid claim ID.'
                });
            }

            const claim = await Claim.findByIdAndUpdate(
                req.params.id,
                { status: status },
                {
                    new: true,
                    runValidators: true
                }
            )
                .populate('item')
                .populate('claimedBy', 'name email studentPRN');

            if (!claim) {
                return res.status(404).json({
                    message: 'Claim not found.'
                });
            }

            res.status(200).json({
                message: 'Claim status updated successfully!',
                claim
            });

        } catch (error) {

            console.error('Claim Update Error:', error);

            res.status(500).json({
                message: 'Unable to update claim status.'
            });

        }

    }
);

// =====================================
// ADMIN: UPDATE REPORTED ITEM STATUS
// =====================================

app.patch(
    '/api/admin/items/:id/status',
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    message: 'Invalid item ID.'
                });
            }

            const { status } = req.body;

            const allowedStatuses = [
                'active',
                'returned',
                'resolved'
            ];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    message: 'Invalid item status.'
                });
            }

            const updatedItem = await Item.findByIdAndUpdate(
                req.params.id,
                { status: status },
                {
                    new: true,
                    runValidators: true
                }
            );

            if (!updatedItem) {
                return res.status(404).json({
                    message: 'Item not found.'
                });
            }

            res.status(200).json({
                message: 'Item status updated successfully!',
                item: updatedItem
            });

        } catch (error) {

            console.error('Update Item Status Error:', error);

            res.status(500).json({
                message: 'Unable to update item status.'
            });

        }

    }
);


// =====================================
// ADMIN: DELETE REPORTED ITEM
// =====================================

console.log('DELETE ITEM ROUTE REGISTERED');

app.delete(
    '/api/admin/items/:id',
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        try {

            // Validate item ID
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({
                    message: 'Invalid item ID.'
                });
            }

            // Find item before deleting
            const item = await Item.findById(req.params.id);

            if (!item) {
                return res.status(404).json({
                    message: 'Item not found.'
                });
            }

            // Delete all claims associated with this item
            const deletedClaims = await Claim.deleteMany({
                item: item._id
            });

            // Delete the item
            await Item.findByIdAndDelete(item._id);

            // Delete uploaded image if it exists
            if (item.image && item.image.startsWith('/uploads/')) {

                const imageName = path.basename(item.image);

                const imagePath = path.join(
                    uploadFolder,
                    imageName
                );

                try {
                    await fs.promises.unlink(imagePath);
                } catch (fileError) {

                    if (fileError.code !== 'ENOENT') {
                        console.error(
                            'Image deletion error:',
                            fileError
                        );
                    }

                }

            }

            res.status(200).json({
                message: 'Item deleted successfully!',
                deletedClaims: deletedClaims.deletedCount
            });

        } catch (error) {

            console.error('Delete Item Error:', error);

            res.status(500).json({
                message: 'Unable to delete item.'
            });

        }

    }
);

// =====================================
// HOME / HEALTH CHECK API
// =====================================

app.get('/api/health', (req, res) => {

    res.status(200).json({
        message: 'CampusFind server is running!'
    });

});

// =====================================
// START SERVER
// =====================================
app.listen(PORT, () => {
    console.log(`CampusFind server running on port ${PORT}`);
});

