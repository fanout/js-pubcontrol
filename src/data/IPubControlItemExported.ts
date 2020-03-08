import IPubControlItemFormatExported from "./IPubControlItemFormatExported";

interface IPubControlItemExports {
    [format: string]: IPubControlItemFormatExported;
}

export default interface IPubControlItemExported {
    channel?: string;
    id?: string;
    "prev-id"?: string;
    [format: string]: any;
}