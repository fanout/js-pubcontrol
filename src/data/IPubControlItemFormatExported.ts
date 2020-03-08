interface IPubControlItemFormatExportedContent {
    content: string;
}

interface IPubControlItemFormatExportedContentBin {
    "content-bin": string;
}

declare type IPubControlItemFormatExported = IPubControlItemFormatExportedContent | IPubControlItemFormatExportedContentBin;

export default IPubControlItemFormatExported;
