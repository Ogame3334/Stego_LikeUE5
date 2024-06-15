export default interface CommunicationFormat{
    from: 'game' | 'camera' | 'server' | 'connection-page',
    method: 'request-connection' | 'enter-pin' | 'connection-applied' | 'connection-invalid' | 'camera-ready' | 'connection-completed' | 'pose-send' | 'disconnected',
    content: {
        [key: string]: any // ここで content の中身のオブジェクトを定義
    }
}
