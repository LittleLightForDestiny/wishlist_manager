import Axios from "axios";

export enum MediaType {
    Upload = "upload",
    Link = "link"
}

export async function importWishlistFile(mediaType:MediaType, data:string|File):Promise<any>{
    switch(mediaType){
        case MediaType.Link:
            let res = await Axios.get(data as string);
            return res.data;

        case MediaType.Upload:
            let file:File = data as File;
            let reader:FileReader = new FileReader();
            return new Promise((resolve)=>{
                reader.addEventListener('load', (event)=>{
                    try{
                        let json = JSON.parse(event?.target?.result as string || "");
                        resolve(json);    
                    }catch(e){}
                });
                reader.readAsText(file);
            });
            
    }
}