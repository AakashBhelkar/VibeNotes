import { Router } from 'express';
import * as FolderController from '../controllers/FolderController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All folder routes require authentication
router.use(authenticate);

// Folder CRUD
router.get('/', FolderController.getAllFolders);
router.get('/tree', FolderController.getFolderTree);
router.post('/', FolderController.createFolder);
router.get('/:id', FolderController.getFolderById);
router.get('/:id/path', FolderController.getFolderPath);
router.get('/:id/notes', FolderController.getNotesInFolder);
router.put('/:id', FolderController.updateFolder);
router.delete('/:id', FolderController.deleteFolder);

// Move note to folder
router.put('/notes/:noteId/move', FolderController.moveNoteToFolder);

export default router;
