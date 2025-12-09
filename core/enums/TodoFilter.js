
export const TodoFilter = {
    ALL: 'all',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    
    isValid(filter) {
        return Object.values(TodoFilter).includes(filter);
    }
};

Object.freeze(TodoFilter);

