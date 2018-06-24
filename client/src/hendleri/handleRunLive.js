
export function handleRunLive(/*kolekcija, start, koliko*/) {

    // UBACITI SERVER LOGIKU

    if (this.state.status === 'Offline') {
        this.setState({status: 'Online'})
    } else if (this.state.status === 'Online') {
        this.setState({status: 'Offline'})
    }
}