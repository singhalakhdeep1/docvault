export enum WorkspaceRole {
    OWNER = "OWNER",
    EDITOR = "EDITOR",
    VIEWER = "VIEWER",
}

export enum DocumentStatus {
    ACTIVE = "ACTIVE",
    ARCHIVED = "ARCHIVED",
    TRASHED = "TRASHED",
}

export interface JwtPayload {
    sub: string;
    email: string;
    iat?: number;
    exp?: number;
}
