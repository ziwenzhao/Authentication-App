export class Recipe {
    _id: string;
    title: string;
    description?: string;
    img: {
        data: any;
        contentType: string;
    }
}