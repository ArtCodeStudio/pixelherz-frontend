import { MatrixCell } from './matrix-cell';

export class Frame {
    constructor(public duration: number, public data: MatrixCell[]) {}
}