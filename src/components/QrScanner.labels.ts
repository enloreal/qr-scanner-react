import type {QrScannerLabels} from './QrScanner'

type Translate = (key: string) => string;

export const getQrScannerLabels = (t: Translate): QrScannerLabels => {
    return {
        title: t('qrScanner.title'),
        startButton: t('qrScanner.startButton'),
        stopButton: t('qrScanner.stopButton'),
        uploadButton: t('qrScanner.uploadButton'),
        base64Title: t('qrScanner.base64Title'),
        resultTitle: t('qrScanner.resultTitle'),
        copyButton: t('qrScanner.copyButton'),
        copiedButton: t('qrScanner.copiedButton')
    }
}