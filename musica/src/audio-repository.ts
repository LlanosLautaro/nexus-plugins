import type Database from "better-sqlite3";

export interface AudioTrackPayload {
  id: string;
  kind?: string;
  name: string;
  duration?: number | null;
  genre?: string | null;
  album?: string | null;
  year?: number | null;
  trackNumber?: number | null;
  discNumber?: number | null;
  mimeType?: string | null;
  bitrate?: number | null;
  sampleRate?: number | null;
  bitsPerSample?: number | null;
  cover?: string | null;
  coverMimeType?: string | null;
  metadataCompleted?: boolean;
  lastScannedAt?: string | Date | null;
}

function toDateText(value: unknown) {
  if (value == null || value === "") {
    return null;
  }

  return value instanceof Date ? value.toISOString() : String(value);
}

export class MusicaAudioRepository {
  constructor(private readonly sqlite: Database.Database) {}

  private normalizeTrack(row: any) {
    if (!row) {
      return null;
    }

    return {
      ...row,
      metadataCompleted: Boolean(row.metadataCompleted),
      authors: this.getAuthorsForTrackSync(String(row.id)),
    };
  }

  private getAuthorsForTrackSync(trackId: string) {
    return this.sqlite.prepare(`
      SELECT aa.id, aa.name, ata.position
      FROM audio_authors aa
      INNER JOIN audio_track_authors ata ON ata.authorId = aa.id
      WHERE ata.audioTrackId = ?
      ORDER BY ata.position ASC, aa.name ASC
    `).all(trackId);
  }

  async findTrackWithAuthors(itemId: string) {
    const row = this.sqlite.prepare("SELECT * FROM audio_tracks WHERE id = ?").get(itemId);
    return this.normalizeTrack(row);
  }

  async deleteTrack(itemId: string) {
    this.sqlite.prepare("DELETE FROM audio_tracks WHERE id = ?").run(itemId);
  }

  async upsertTrack(payload: AudioTrackPayload) {
    const normalized = {
      kind: "song",
      duration: null,
      genre: null,
      album: null,
      year: null,
      trackNumber: null,
      discNumber: null,
      mimeType: null,
      bitrate: null,
      sampleRate: null,
      bitsPerSample: null,
      cover: null,
      coverMimeType: null,
      ...payload,
      metadataCompleted: payload.metadataCompleted ? 1 : 0,
      lastScannedAt: toDateText(payload.lastScannedAt),
    };

    this.sqlite.prepare(`
      INSERT INTO audio_tracks (
        id, kind, name, duration, genre, album, year, trackNumber, discNumber,
        mimeType, bitrate, sampleRate, bitsPerSample, cover, coverMimeType,
        metadataCompleted, lastScannedAt
      ) VALUES (
        @id, @kind, @name, @duration, @genre, @album, @year, @trackNumber, @discNumber,
        @mimeType, @bitrate, @sampleRate, @bitsPerSample, @cover, @coverMimeType,
        @metadataCompleted, @lastScannedAt
      )
      ON CONFLICT(id) DO UPDATE SET
        kind = excluded.kind,
        name = excluded.name,
        duration = excluded.duration,
        genre = excluded.genre,
        album = excluded.album,
        year = excluded.year,
        trackNumber = excluded.trackNumber,
        discNumber = excluded.discNumber,
        mimeType = excluded.mimeType,
        bitrate = excluded.bitrate,
        sampleRate = excluded.sampleRate,
        bitsPerSample = excluded.bitsPerSample,
        cover = excluded.cover,
        coverMimeType = excluded.coverMimeType,
        metadataCompleted = excluded.metadataCompleted,
        lastScannedAt = excluded.lastScannedAt
    `).run(normalized);

    return this.findTrackWithAuthors(payload.id);
  }

  async replaceTrackAuthors(trackId: string, authorNames: string[]) {
    const transaction = this.sqlite.transaction((names: string[]) => {
      this.sqlite.prepare("DELETE FROM audio_track_authors WHERE audioTrackId = ?").run(trackId);

      const insertAuthor = this.sqlite.prepare(`
        INSERT INTO audio_authors (name)
        VALUES (?)
        ON CONFLICT(name) DO NOTHING
      `);
      const findAuthor = this.sqlite.prepare("SELECT id FROM audio_authors WHERE name = ?");
      const insertJoin = this.sqlite.prepare(`
        INSERT INTO audio_track_authors (audioTrackId, authorId, position)
        VALUES (?, ?, ?)
      `);

      for (const [index, name] of names.entries()) {
        insertAuthor.run(name);
        const author = findAuthor.get(name) as any;
        if (author?.id != null) {
          insertJoin.run(trackId, author.id, index);
        }
      }
    });

    transaction(authorNames);
  }
}
