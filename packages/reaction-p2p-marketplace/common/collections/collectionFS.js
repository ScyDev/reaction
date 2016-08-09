/**
 * Define CollectionFS collection
 * See: https://github.com/CollectionFS/Meteor-CollectionFS
 * chunkSize: 1024*1024*2; <- CFS default // 256k is default GridFS chunk size, but performs terribly
 */
const orient = obj => {
  const package = ReactionCore.Collections.Packages.findOne(
    { name: "p2p-marketplace" },
    { fields: { "settings.public.imageAutoOrient": 1 } }
  );
  const auto = package && package.settings.public.imageAutoOrient;
  // console.log("Image processing. Auto orientation", auto);
  return auto ? obj.autoOrient() : obj;
}

const imageTransformers = {
  large: (fileObj, readStream) => orient(gm(readStream, fileObj.name)).resize("1000", "1000").stream(),
  medium: (fileObj, readStream) => orient(gm(readStream, fileObj.name)).resize("600", "600").stream(),
  small: (fileObj, readStream) =>
    orient(gm(readStream)).resize("235", "235" + "^").gravity("Center").extent("235", "235").stream("PNG"),
  thumbnail: (fileObj, readStream) =>
    orient(gm(readStream)).resize("100", "100" + "^").gravity("Center").extent("100", "100").stream("PNG"),
};

/* Replace image upload transformers */
Meteor.startup(() => {
  for (let store of ReactionCore.Collections.Media.options.stores) {
    const transformer = imageTransformers[store.name];
    if (!transformer) continue;
    const fn = (fileObj, readStream, writeStream) => {
      (gm && gm.isAvailable ? transformer(fileObj, readStream) : readStream).pipe(writeStream)
    };
    store.transformWrite = fn;
    if (Meteor.isServer) store._transform.transformWrite = fn;
  }
});

/* Update upload size limit of settings change */
if (Meteor.isClient) Tracker.autorun(() => {
  const package = ReactionCore.Collections.Packages.findOne(
    { name: "p2p-marketplace" },
    { fields: { "settings.public.maxUploadSize": 1 } }
  );
  if (!package) return;
  const maxUploadSize = package.settings.public.maxUploadSize;
  ReactionCore.Collections.Media.filters({
    maxSize: maxUploadSize,
    onInvalid: message => {
      throw new Meteor.Error(403, "imageTooBig", { maxKb: Math.trunc(maxUploadSize / 1024), message });
    },
  })
})
