
import { CounterLimits } from './CounterLimits.js';

export const CounterErrorMessages = {
    INVALID_STEP_TYPE: 'Step deve ser um número',
    STEP_TOO_LOW: `Step deve ser no mínimo ${CounterLimits.STEP_MIN}`,
    STEP_TOO_HIGH: `Step não pode ser maior que ${CounterLimits.STEP_MAX}`,
    VALUE_OUT_OF_BOUNDS: 'Valor fora dos limites permitidos'
};

Object.freeze(CounterErrorMessages);

