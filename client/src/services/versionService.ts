import { db, NoteVersion } from '@/lib/db';

/**
 * Service for managing note version history
 */
export const versionService = {
    /**
     * Save a new version of a note
     */
    async saveVersion(noteId: string, title: string, content: string, tags: string[], userId: string): Promise<void> {
        try {
            // Get the current version number
            const versions = await db.noteVersions
                .where('noteId')
                .equals(noteId)
                .toArray();

            const nextVersion = versions.length + 1;

            // Save the new version
            await db.noteVersions.add({
                noteId,
                version: nextVersion,
                title,
                content,
                tags,
                createdAt: new Date(),
                userId
            });

            // Keep only the last 50 versions per note
            if (versions.length >= 50) {
                const oldestVersions = versions
                    .sort((a, b) => a.version - b.version)
                    .slice(0, versions.length - 49);

                for (const version of oldestVersions) {
                    if (version.id) {
                        await db.noteVersions.delete(version.id);
                    }
                }
            }
        } catch (err) {
            throw err;
        }
    },

    /**
     * Get all versions for a note
     */
    async getVersions(noteId: string): Promise<NoteVersion[]> {
        try {
            const versions = await db.noteVersions
                .where('noteId')
                .equals(noteId)
                .reverse()
                .sortBy('version');

            return versions;
        } catch {
            return [];
        }
    },

    /**
     * Get a specific version
     */
    async getVersion(noteId: string, version: number): Promise<NoteVersion | null> {
        try {
            const noteVersion = await db.noteVersions
                .where(['noteId', 'version'])
                .equals([noteId, version])
                .first();

            return noteVersion || null;
        } catch {
            return null;
        }
    },

    /**
     * Delete all versions for a note
     */
    async deleteVersions(noteId: string): Promise<void> {
        try {
            await db.noteVersions
                .where('noteId')
                .equals(noteId)
                .delete();
        } catch (err) {
            throw err;
        }
    },

    /**
     * Get version count for a note
     */
    async getVersionCount(noteId: string): Promise<number> {
        try {
            return await db.noteVersions
                .where('noteId')
                .equals(noteId)
                .count();
        } catch {
            return 0;
        }
    }
};
