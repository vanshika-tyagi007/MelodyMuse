import { db } from '../firebase';
import {
    getFirestore, collection, addDoc, getDocs, getDoc, setDoc, doc,
    query, where, orderBy, limit, deleteDoc, updateDoc, arrayUnion, arrayRemove,
    serverTimestamp, writeBatch
} from 'firebase/firestore';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const addToHistory = async (userId, video) => {
    if (!userId || !video) return;
    // Add to history collection
    await addDoc(collection(db, 'users', userId, 'history'), {
        ...video,
        playedAt: serverTimestamp()
    });
};

export const getHistory = async (userId) => {
    if (!userId) return [];
    const q = query(
        collection(db, 'users', userId, 'history'),
        orderBy('playedAt', 'desc'),
        limit(50)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const uploadProfileImage = async (userId, file) => {
    if (!userId || !file) return null;
    const storageRef = ref(storage, `users / ${userId}/profile_${Date.now()}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
};

export const toggleLikeSong = async (userId, video) => {
    if (!userId || !video) return;
    const likeRef = doc(db, 'users', userId, 'likedSongs', video.id.videoId);
    const snap = await getDoc(likeRef);

    if (snap.exists()) {
        await deleteDoc(likeRef);
        return false; // Not liked anymore
    } else {
        await setDoc(likeRef, {
            ...video,
            likedAt: serverTimestamp()
        });
        return true; // Liked
    }
};

export const checkIsLiked = async (userId, videoId) => {
    if (!userId || !videoId) return false;
    const likeRef = doc(db, 'users', userId, 'likedSongs', videoId);
    const snap = await getDoc(likeRef);
    return snap.exists();
};

export const getLikedSongs = async (userId) => {
    if (!userId) return [];
    const q = query(collection(db, 'users', userId, 'likedSongs'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
};

export const createPlaylist = async (userId, name) => {
    if (!userId || !name) return;
    await addDoc(collection(db, 'users', userId, 'playlists'), {
        name,
        createdAt: serverTimestamp(),
        songs: []
    });
};

export const getPlaylists = async (userId) => {
    if (!userId) return [];
    const q = query(collection(db, 'users', userId, 'playlists'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addToPlaylist = async (userId, playlistId, video) => {
    if (!userId || !playlistId || !video) return;
    const playlistRef = doc(db, 'users', userId, 'playlists', playlistId);
    const playlistSnap = await getDoc(playlistRef);

    if (playlistSnap.exists()) {
        const playlist = playlistSnap.data();
        const updatedSongs = [...(playlist.songs || []), video];
        await setDoc(playlistRef, { songs: updatedSongs }, { merge: true });
    }
};

// Simple subscription (just storing channel IDs)
export const toggleSubscribe = async (userId, channelId, channelTitle) => {
    if (!userId || !channelId) return;
    const subRef = doc(db, 'users', userId, 'subscriptions', channelId);
    const snap = await getDoc(subRef);

    if (snap.exists()) {
        await deleteDoc(subRef);
        return false;
    } else {
        await setDoc(subRef, {
            channelId,
            channelTitle,
            subscribedAt: serverTimestamp()
        });
        return true;
    }
};

export const checkIsSubscribed = async (userId, channelId) => {
    if (!userId || !channelId) return false;
    const subRef = doc(db, 'users', userId, 'subscriptions', channelId);
    const snap = await getDoc(subRef);
    return snap.exists();
};

export const addToSearchHistory = async (userId, queryText) => {
    if (!userId || !queryText) return;
    try {
        await addDoc(collection(db, 'users', userId, 'searchHistory'), {
            query: queryText,
            searchedAt: serverTimestamp()
        });
    } catch (e) {
        console.error("Error adding search history: ", e);
    }
};

export const getSearchHistory = async (userId) => {
    if (!userId) return [];
    try {
        const q = query(
            collection(db, 'users', userId, 'searchHistory'),
            orderBy('searchedAt', 'desc'),
            limit(5)
        );
        const snapshot = await getDocs(q);
        // Filter unique queries? Or just return raw. Let's return raw for now.
        // Actually, unique queries would be better UI-wise but let's keep it simple.
        const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return history;
    } catch (e) {
        console.error("Error getting search history: ", e);
        return [];
    }
};

export const deleteSearchHistoryItem = async (userId, docId) => {
    if (!userId || !docId) return;
    try {
        await deleteDoc(doc(db, 'users', userId, 'searchHistory', docId));
    } catch (e) {
        console.error("Error deleting search history item: ", e);
    }
};

export const clearSearchHistory = async (userId) => {
    if (!userId) return;
    try {
        const q = query(collection(db, 'users', userId, 'searchHistory'));
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    } catch (e) {
        console.error("Error clearing search history: ", e);
    }
};
