import { Router } from 'express';
import * as ColorLabelController from '../controllers/ColorLabelController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All color label routes require authentication
router.use(authenticate);

// Color Label CRUD
router.get('/', ColorLabelController.getAllLabels);
router.post('/', ColorLabelController.createLabel);
router.get('/:id', ColorLabelController.getLabelById);
router.put('/:id', ColorLabelController.updateLabel);
router.delete('/:id', ColorLabelController.deleteLabel);

// Note-Label associations
router.get('/notes/:noteId', ColorLabelController.getNoteLabels);
router.put('/notes/:noteId', ColorLabelController.updateNoteLabels);
router.post('/notes/:noteId/labels/:labelId', ColorLabelController.assignLabelToNote);
router.delete('/notes/:noteId/labels/:labelId', ColorLabelController.removeLabelFromNote);

export default router;
