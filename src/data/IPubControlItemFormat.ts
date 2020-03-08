export default interface IPubControlItemFormat {
    name(): string;
    // if content-bin, it's base64-encoded
    export(): { content: string } | { "content-bin": string };
}
