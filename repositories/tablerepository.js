'use strict';

class TableRepository {
    constructor() {
        if (!this.findExistingTable) throw new Error("findExistingTable must be implemented");
        if (!this.findListTables) throw new Error("findListTables must be implemented");
        if (!this.findTotalTables) throw new Error("findTotalTables must be implemented");
        if (!this.saveTableElection) throw new Error("saveTableElection must be implemented");
    }
}

module.exports = TableRepository;
