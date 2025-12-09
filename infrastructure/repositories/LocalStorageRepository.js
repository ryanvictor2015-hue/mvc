
import { Repository } from '../../core/repositories/Repository.js';

const createMemoryStorageAdapter = () => {
    const memory = new Map();
    return {
        getItem: (key) => memory.has(key) ? memory.get(key) : null,
        setItem: (key, value) => memory.set(key, String(value)),
        removeItem: (key) => memory.delete(key)
    };
};

export class LocalStorageRepository extends Repository {
    constructor(storageKey, deserializer = null, serializer = null, storageAdapter = null) {
        super();
        
        if (!storageKey) {
            throw new Error('LocalStorageRepository: storageKey é obrigatório');
        }

        // Suporta assinatura antiga e objeto de opções.
        if (typeof deserializer === 'object' && deserializer !== null) {
            const options = deserializer;
            deserializer = options.deserializer ?? null;
            serializer = options.serializer ?? null;
            storageAdapter = options.storageAdapter ?? options.storage ?? null;
        }
        
        const defaultStorage = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : null;

        this._storageKey = storageKey;
        this._deserializer = deserializer || ((data) => JSON.parse(data));
        this._serializer = serializer || ((data) => JSON.stringify(data));
        this._storage = this._resolveStorageAdapter(storageAdapter);
        this._isFallback = defaultStorage ? this._storage !== defaultStorage : true;
    }

    _resolveStorageAdapter(storageAdapter) {
        if (storageAdapter) {
            return storageAdapter;
        }

        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const testKey = `__ls_check_${Date.now()}`;
                window.localStorage.setItem(testKey, 'ok');
                window.localStorage.removeItem(testKey);
                return window.localStorage;
            }
        } catch (error) {
            console.warn('[LocalStorageRepository] localStorage indisponível, usando memória', error);
        }

        return createMemoryStorageAdapter();
    }

    _switchToFallbackStorage(reason, originalError) {
        if (this._isFallback) {
            return;
        }
        console.warn(`[LocalStorageRepository] alternando para storage em memória (${reason})`, originalError);
        this._storage = createMemoryStorageAdapter();
        this._isFallback = true;
    }

    _safeGetItem() {
        try {
            return this._storage.getItem(this._storageKey);
        } catch (error) {
            this._switchToFallbackStorage('getItem falhou', error);
            return null;
        }
    }

    _safeSetItem(value) {
        try {
            this._storage.setItem(this._storageKey, value);
            return true;
        } catch (error) {
            this._switchToFallbackStorage('setItem falhou', error);
            try {
                this._storage.setItem(this._storageKey, value);
                return true;
            } catch (fallbackError) {
                console.error('[LocalStorageRepository] Falha ao gravar mesmo em fallback', fallbackError);
                return false;
            }
        }
    }

    _safeRemoveItem() {
        try {
            this._storage.removeItem(this._storageKey);
            return true;
        } catch (error) {
            this._switchToFallbackStorage('removeItem falhou', error);
            try {
                this._storage.removeItem(this._storageKey);
                return true;
            } catch (fallbackError) {
                console.error('[LocalStorageRepository] Falha ao remover mesmo em fallback', fallbackError);
                return false;
            }
        }
    }

    getAll() {
        const data = this._safeGetItem();
        if (!data) return [];

        try {
            return this._deserializer(data);
        } catch (error) {
            console.error(`[LocalStorageRepository] Dados inválidos/corrompidos em ${this._storageKey}:`, error);
            throw new Error(`LocalStorageRepository: não foi possível desserializar ${this._storageKey}`);
        }
    }

    getById(id) {
        const items = this.getAll();
        return items.find(item => item.id === id) || null;
    }

    save(entity) {
        if (!entity || !entity.id) {
            throw new Error('LocalStorageRepository.save(): entidade deve ter propriedade "id"');
        }

        try {
            const items = this.getAll();
            const index = items.findIndex(item => item.id === entity.id);
            
            if (index >= 0) {
                items[index] = entity;
            } else {
                items.push(entity);
            }
            
            const payload = this._serializer(items);
            const saved = this._safeSetItem(payload);
            if (!saved) {
                throw new Error(`[LocalStorageRepository] Não foi possível salvar ${this._storageKey}`);
            }
            return entity;
        } catch (error) {
            console.error(`[LocalStorageRepository] Erro ao salvar em ${this._storageKey}:`, error);
            throw error;
        }
    }

    delete(id) {
        try {
            const items = this.getAll();
            const initialLength = items.length;
            const filtered = items.filter(item => item.id !== id);
            
            if (filtered.length === initialLength) {
                return false;
            }
            
            const payload = this._serializer(filtered);
            const saved = this._safeSetItem(payload);
            if (!saved) {
                throw new Error(`[LocalStorageRepository] Não foi possível deletar de ${this._storageKey}`);
            }
            return true;
        } catch (error) {
            console.error(`[LocalStorageRepository] Erro ao deletar de ${this._storageKey}:`, error);
            throw error;
        }
    }

    clear() {
        this._safeRemoveItem();
    }

}

