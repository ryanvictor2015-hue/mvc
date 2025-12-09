
export class Repository {
    
    getAll() {
        throw new Error('Repository.getAll() deve ser implementado');
    }

    getById(id) {
        throw new Error('Repository.getById() deve ser implementado');
    }

    save(entity) {
        throw new Error('Repository.save() deve ser implementado');
    }

    delete(id) {
        throw new Error('Repository.delete() deve ser implementado');
    }
}

