import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { ProjectDocument, VersionDocument } from '@/types/firestore';

const PROJECTS_COLLECTION = 'projects';

export const projectService = {
  // 1. CREATE A NEW PROJECT
  async createProject(userId: string, title: string, initialData: any = {}) {
    const newProject = {
      ownerId: userId,
      title: title || 'Untitled Project',
      status: 'draft',
      lastModified: serverTimestamp(),
      data: {
        logline: initialData.logline || '',
        synopsis: initialData.synopsis || {},
        modules: initialData.modules || { characters: [], settings: [], themes: [], plots: [] }
      }
    };
    
    const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), newProject);
    return docRef.id;
  },

  // 2. GET USER'S PROJECTS (For Dashboard)
  async getUserProjects(userId: string) {
    const q = query(
      collection(db, PROJECTS_COLLECTION),
      where('ownerId', '==', userId),
      orderBy('lastModified', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ProjectDocument[];
  },

  // 3. GET SINGLE PROJECT (For Workspace)
  async getProject(projectId: string) {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) throw new Error('Project not found');
    return { id: snapshot.id, ...snapshot.data() } as ProjectDocument;
  },

  // 4. UPDATE PROJECT (Auto-save)
  async updateProject(projectId: string, data: Partial<ProjectDocument['data']>) {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    await updateDoc(docRef, {
      data: data,
      lastModified: serverTimestamp()
    });
  },

  // 5. SAVE VERSION (Snapshot)
  async saveVersion(projectId: string, phase: string, data: any) {
    const versionsRef = collection(db, PROJECTS_COLLECTION, projectId, 'versions');
    await addDoc(versionsRef, {
      timestamp: serverTimestamp(),
      label: `${phase.charAt(0).toUpperCase() + phase.slice(1)} Draft`,
      phase,
      snapshotData: data
    });
  },

  // 6. GET VERSIONS
  async getVersions(projectId: string) {
    const versionsRef = collection(db, PROJECTS_COLLECTION, projectId, 'versions');
    const q = query(versionsRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as VersionDocument[];
  }
};