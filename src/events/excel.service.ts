import * as fs from 'fs';
import * as xlsx from 'xlsx';
import { AddEventDto } from './dto/create-event.dto';


export class ExcelService {
    file: Express.Multer.File;

    constructor(file: Express.Multer.File) {
        this.file = file;
    }

    parseFile() {
        const WB = xlsx.readFile(this.file.path);
        const totalSheets = Object.keys(WB.Sheets);

        for (let sheet of totalSheets) {
            this.parseSheet(WB.Sheets[sheet])
        }

        return totalSheets.map(sheet => this.parseSheet(WB.Sheets[sheet]));
    }

    removeFile() {
        fs.promises.unlink(this.file.path)
    }


    parseSheet(sheet: xlsx.WorkSheet) {
        // event has 15 columns
        const totalRows = this.getTotalRows(sheet);
        const totalCols = this.getTotalColumns(sheet);
    
        const event: AddEventDto = this.initializeEvent(sheet);
    
        for (let currRow = 1; currRow < totalRows; currRow++) {
            for (let currCol = 0; currCol < totalCols; currCol++) {
                const cell = sheet[
                    xlsx.utils.encode_cell({ r: currRow, c: currCol })
                ];

                if (cell) {
                    const cellValue = cell.v;
                    const cellHeader = sheet[
                        xlsx.utils.encode_cell({ r: 0, c: currCol })
                    ].v;
                    if (cellHeader === 'categories') {
                        event[cellHeader] = cellValue.split(',')
                    } else {
                        event[cellHeader] = cellValue;
                    }
                }
            }
        }
    
        return event;
    }

    getTotalRows(sheet: xlsx.WorkSheet) {
        const range = xlsx.utils.decode_range(sheet['!ref']);
        // 0-based indexing, hence should be using +1.. but skipping the first row
        return range.e.r - range.s.r + 1;
    }
    
    getTotalColumns(sheet: xlsx.WorkSheet) {
        const range = xlsx.utils.decode_range(sheet['!ref']);
        // 0-based indexing
        return range.e.c - range.s.c + 1;
    }

    initializeEvent(sheet: xlsx.WorkSheet) {
        const event = {} as AddEventDto;
        const totalCols = this.getTotalColumns(sheet);
    
        for (let currCol = 0; currCol < totalCols; currCol++) {
            const nextCell = sheet[
                xlsx.utils.encode_cell({ r: 0, c: currCol })
            ];
            event[nextCell.v] = null;
        }
        return event;
    }
}