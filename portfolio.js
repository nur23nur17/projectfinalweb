const express = require('express');
const router = express.Router();
const PortfolioItem = require('../models/PortfolioItem');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');
const sendEmail = require('../utils/mailer');

router.get('/', async (req, res) => {
    try {
        const items = await PortfolioItem.find();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch portfolio items' });
    }
});

router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    const { title, description, images } = req.body;
    console.log('user: ', req.user?.userId);
    try {
        const newItem = new PortfolioItem({
            title,
            description,
            images,
            createdBy: req.user?.userId,
        });
        await newItem.save();

        await sendEmail(
            req.user.email,
            'Portfolio Item Created',
            `A new portfolio item titled "${title}" has been created.`
        );

        res.status(201).json(newItem);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Failed to create portfolio item' });
    }
});

router.put('/:id', authenticateToken, authorizeRole(['admin', 'editor']), async (req, res) => {
    const { id } = req.params;
    const { title, description, images } = req.body;
    try {
        const updatedItem = await PortfolioItem.findByIdAndUpdate(
            id,
            { title, description, images },
            { new: true }
        );
        console.log('user email:', req.user)

        await sendEmail(
            req.user.email,
            'Portfolio Item Edited',
            `A new portfolio item titled "${title}" has been edited.`
        );

        res.json(updatedItem);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update portfolio item' });
    }
});

router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    const { id } = req.params;
    try {
        const deletedItem = await PortfolioItem.findByIdAndDelete(id);

        await sendEmail(
            req.user.email,
            'Portfolio Item Deleted',
            `A new portfolio item titled "${deletedItem?.title}" has been deleted.`
        );

        res.json({ message: 'Portfolio item deleted' });
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: 'Failed to delete portfolio item' });
    }
});

module.exports = router;
