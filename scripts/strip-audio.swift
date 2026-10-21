// Copia un MP4 sin su pista de audio, sin recodificar el video (exportación passthrough).
// Las muestras H.264 se copian tal cual: misma resolución y calidad; moov al inicio.
// Requiere macOS con AVFoundation (Command Line Tools).
//
// Uso: swift scripts/strip-audio.swift entrada.mp4 salida.mp4
import AVFoundation
import Foundation

let args = CommandLine.arguments
guard args.count == 3 else {
    FileHandle.standardError.write("Uso: swift strip-audio.swift entrada.mp4 salida.mp4\n".data(using: .utf8)!)
    exit(64)
}
let input = URL(fileURLWithPath: args[1])
let output = URL(fileURLWithPath: args[2])
try? FileManager.default.removeItem(at: output)

let asset = AVURLAsset(url: input)
let semaphore = DispatchSemaphore(value: 0)
var failure: String?

Task {
    do {
        guard let source = try await asset.loadTracks(withMediaType: .video).first else {
            failure = "El archivo no tiene pista de video"
            semaphore.signal()
            return
        }
        let duration = try await asset.load(.duration)
        let composition = AVMutableComposition()
        guard let track = composition.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid) else {
            failure = "No se pudo crear la pista"
            semaphore.signal()
            return
        }
        try track.insertTimeRange(CMTimeRange(start: .zero, duration: duration), of: source, at: .zero)
        track.preferredTransform = try await source.load(.preferredTransform)

        guard let export = AVAssetExportSession(asset: composition, presetName: AVAssetExportPresetPassthrough) else {
            failure = "No se pudo crear la exportación"
            semaphore.signal()
            return
        }
        export.shouldOptimizeForNetworkUse = true
        try await export.export(to: output, as: .mp4)
    } catch {
        failure = error.localizedDescription
    }
    semaphore.signal()
}
semaphore.wait()
if let failure {
    FileHandle.standardError.write("Error: \(failure)\n".data(using: .utf8)!)
    exit(1)
}
print("Copia sin audio: \(output.path)")
