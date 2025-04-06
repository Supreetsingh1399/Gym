declare module "firebase/app" {
  export interface FirebaseApp {
    name: string;
    options: object;
    automaticDataCollectionEnabled: boolean;
    // Add any other properties or methods your app uses
  }

  export interface FirebaseOptions {
    apiKey?: string;
    authDomain?: string;
    databaseURL?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
    measurementId?: string;
  }

  export function initializeApp(
    options: FirebaseOptions,
    name?: string,
  ): FirebaseApp;
  export function getApp(name?: string): FirebaseApp;
  export function getApps(): FirebaseApp[];
  export function deleteApp(app: FirebaseApp): Promise<void>;

  export interface FirebaseError extends Error {
    code: string;
    message: string;
    name: string;
  }

  // Add any other functions you use from firebase/app
}

declare module "firebase/auth" {
  import { FirebaseApp } from "firebase/app";

  export interface Auth {
    app: FirebaseApp;
    name: string;
    config: object;
    currentUser: User | null;
    languageCode: string | null;
    settings: object;
    tenantId: string | null;
    // Add methods
    signOut(): Promise<void>;
    // Add any other properties or methods you use
  }

  export interface UserCredential {
    user: User;
    providerId: string | null;
    operationType: string | null;
  }

  export interface User {
    uid: string;
    email: string | null;
    emailVerified: boolean;
    isAnonymous: boolean;
    metadata: {
      creationTime: string;
      lastSignInTime: string;
    };
    phoneNumber: string | null;
    photoURL: string | null;
    providerData: any[];
    refreshToken: string;
    tenantId: string | null;
    displayName: string | null;
    // Add userType if you've extended the User type
    userType?: string;
    // Add methods
    getIdToken(forceRefresh?: boolean): Promise<string>;
    delete(): Promise<void>;
    // Add any other properties or methods you use
  }

  export function getAuth(app?: FirebaseApp): Auth;
  export function createUserWithEmailAndPassword(
    auth: Auth,
    email: string,
    password: string,
  ): Promise<UserCredential>;
  export function signInWithEmailAndPassword(
    auth: Auth,
    email: string,
    password: string,
  ): Promise<UserCredential>;
  export function sendPasswordResetEmail(
    auth: Auth,
    email: string,
  ): Promise<void>;
  export function sendEmailVerification(user: User): Promise<void>;
  export function onAuthStateChanged(
    auth: Auth,
    callback: (user: User | null) => void,
  ): () => void;
  export function initializeAuth(app: FirebaseApp, options: any): Auth;
  export function getReactNativePersistence(storage: any): any;
  // Add any other functions you use from firebase/auth
}

declare module "firebase/firestore" {
  import { FirebaseApp } from "firebase/app";

  export interface Firestore {
    app: FirebaseApp;
    name: string;
    // Add any other properties or methods you use
  }

  export interface DocumentReference {
    id: string;
    path: string;
    parent: CollectionReference;
    // Add any other properties or methods you use
  }

  export interface CollectionReference {
    id: string;
    path: string;
    parent: DocumentReference | null;
    // Add any other properties or methods you use
  }

  export interface DocumentSnapshot {
    id: string;
    exists(): boolean;
    data(): any;
    get(field: string): any;
    // Add any other properties or methods you use
  }

  export interface QuerySnapshot {
    docs: DocumentSnapshot[];
    empty: boolean;
    size: number;
    // Add any other properties or methods you use
  }

  export interface QueryConstraint {
    type: string;
    // Add any other properties or methods you use
  }

  export function getFirestore(app?: FirebaseApp): Firestore;
  export function collection(
    firestore: Firestore,
    path: string,
  ): CollectionReference;
  export function doc(
    firestore: Firestore,
    path: string,
    ...pathSegments: string[]
  ): DocumentReference;
  export function getDoc(
    reference: DocumentReference,
  ): Promise<DocumentSnapshot>;
  export function getDocs(
    query: CollectionReference | any,
  ): Promise<QuerySnapshot>;
  export function setDoc(
    reference: DocumentReference,
    data: any,
  ): Promise<void>;
  export function updateDoc(
    reference: DocumentReference,
    data: any,
  ): Promise<void>;
  export function deleteDoc(reference: DocumentReference): Promise<void>;
  export function query(
    collectionRef: CollectionReference,
    ...constraints: QueryConstraint[]
  ): any;
  export function where(
    field: string,
    opStr: string,
    value: any,
  ): QueryConstraint;
  export function orderBy(
    field: string,
    directionStr?: "asc" | "desc",
  ): QueryConstraint;
  export function limit(limit: number): QueryConstraint;
  export function startAfter(...fieldValues: any[]): QueryConstraint;
  export function startAt(...fieldValues: any[]): QueryConstraint;
  export function endAt(...fieldValues: any[]): QueryConstraint;
  export function endBefore(...fieldValues: any[]): QueryConstraint;
  // Add any other functions you use from firebase/firestore
}

declare module "firebase/storage" {
  import { FirebaseApp } from "firebase/app";

  export interface FirebaseStorage {
    app: FirebaseApp;
    name: string;
    // Add any other properties or methods you use
  }

  export interface StorageReference {
    bucket: string;
    fullPath: string;
    name: string;
    parent: StorageReference | null;
    root: StorageReference;
    // Add any other properties or methods you use
  }

  export function getStorage(app?: FirebaseApp): FirebaseStorage;
  export function ref(
    storage: FirebaseStorage,
    path?: string,
  ): StorageReference;
  export function uploadBytes(
    reference: StorageReference,
    data: Blob | Uint8Array | ArrayBuffer,
  ): Promise<any>;
  export function uploadString(
    reference: StorageReference,
    value: string,
    format?: string,
  ): Promise<any>;
  export function getDownloadURL(reference: StorageReference): Promise<string>;
  export function deleteObject(reference: StorageReference): Promise<void>;
  // Add any other functions you use from firebase/storage
}
