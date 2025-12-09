
import { TodoLimits } from './TodoLimits.js';

export const TodoErrorMessages = {
    TEXT_EMPTY: 'Texto da tarefa não pode estar vazio',
    TEXT_TOO_LONG: `Texto muito longo (máximo ${TodoLimits.TEXT_MAX_LENGTH} caracteres)`,
    TEXT_TOO_SHORT: `Texto muito curto (mínimo ${TodoLimits.TEXT_MIN_LENGTH} caractere)`,
    TODO_NOT_FOUND: 'Tarefa não encontrada',
    INVALID_ID: 'ID da tarefa é inválido'
};

Object.freeze(TodoErrorMessages);

