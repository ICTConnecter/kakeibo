import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App | null = null;
let adminDb: Firestore | null = null;

export const getAdminApp = (): App => {
    if (!adminApp) {
        const apps = getApps();
        
        if (apps.length > 0) {
            adminApp = apps[0];
        } else {
            const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
            const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
            const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

            if (!projectId) {
                throw new Error('NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set');
            }

            // サービスアカウントの認証情報がある場合
            if (clientEmail && privateKey) {
                adminApp = initializeApp({
                    credential: cert({
                        projectId,
                        clientEmail,
                        privateKey,
                    }),
                });
            } else {
                // デフォルト認証を使用（GCPにデプロイ時など）
                adminApp = initializeApp({
                    projectId,
                });
            }
        }
    }

    return adminApp;
};

export const getAdminDb = (): Firestore => {
    if (!adminDb) {
        const app = getAdminApp();
        adminDb = getFirestore(app);
    }

    return adminDb;
};

