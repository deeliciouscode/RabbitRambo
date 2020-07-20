// work from Sebastian Mader
export class AssetLoader {
    loadAsset(name, url, type) {
        switch (type) {
            case "image":
                return new Promise((resolve, reject) => {
                    const image = new Image();
                    image.src = url;
                    image.addEventListener("load", function () {
                        return resolve({ name, asset: this });
                    });
                });
             case "audio":
                return new Promise((resolve, reject) => {
                    const audio = new Audio(url);
                    audio.addEventListener("loadeddata", function () {
                        return resolve({ name, asset: this });
                    });
                }); 
            default:
                return Promise.reject(new Error("Unknown type"));
        }
    }
    loadAssets(assetsToLoad) {
        return Promise.all(
            assetsToLoad.map(asset =>
                this.loadAsset(asset.name, asset.url, asset.type)
            )
        )
            .then(assets =>
                assets.reduceRight(
                    (acc, elem) => ({
                        ...acc,
                        [elem.name]: elem.asset
                    }),
                    {}
                )
            )
            .catch(error => {
                throw new Error("Not all assets could be loaded.");
            });
    }
}
