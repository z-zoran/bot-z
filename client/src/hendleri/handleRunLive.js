
export function handleRunLive(/*kolekcija, start, koliko*/) {

    // UBACITI SERVER LOGIKU

    if (this.state.stat === 'Offline') {
        this.setState({stat: 'Online'})
    } else if (this.state.stat === 'Online') {
        this.setState({stat: 'Offline'})
    }
}