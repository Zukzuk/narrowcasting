export default class SessionRepository {
    constructor(private session: any) {}

    save(remainingSet: number[]): void {
        this.session.remainingSet = remainingSet;
    }
    
    retrieve(amount: number): number[] {
        if (!this.session.remainingSet || this.session.remainingSet.length === 0) {
            this.session.remainingSet = Array.from({ length: amount }, (_, i) => i);
        }
        return this.session.remainingSet;
    }
}
