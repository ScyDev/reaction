/**
 * core collectionsFS configurations
 */
FS.HTTP.setBaseUrl("/assets");
FS.HTTP.setHeadersForGet([
  ["Cache-Control", "public, max-age=31536000"]
]);

/**
 * Define CollectionFS collection
 * See: https://github.com/CollectionFS/Meteor-CollectionFS
 * chunkSize: 1024*1024*2; <- CFS default // 256k is default GridFS chunk size, but performs terribly
 */
let maxUploadKb = 1048576; //bytes

ReactionCore.Collections.Media = new FS.Collection("Media", {
  filter: {
        maxSize: maxUploadKb, //bytes  0.5MB = 524288 bytes
        /*allow: {
            contentTypes: ['image/*'], // regex wildcard
            extensions: ['']
        },*//*
        deny: {
            contentTypes: [''],
            extensions: ['']
        },*/
        onInvalid: function(message) {
            // do stuff if error
            throw new Meteor.Error(403, "imageTooBig", {maxKb: (maxUploadKb/1024)});
        }
    },
  stores: [
    new FS.Store.GridFS("image", {
      chunkSize: 1 * 1024 * 1024
    }), new FS.Store.GridFS("large", {
      chunkSize: 1 * 1024 * 1024,
      transformWrite: function (fileObj, readStream, writeStream) {
        if (gm.isAvailable) {
          gm(readStream, fileObj.name).autoOrient().resize("1000", "1000").stream()
            .pipe(writeStream);
        } else {
          readStream.pipe(writeStream);
        }
      }
    }), new FS.Store.GridFS("medium", {
      chunkSize: 1 * 1024 * 1024,
      transformWrite: function (fileObj, readStream, writeStream) {
        if (gm.isAvailable) {
          gm(readStream, fileObj.name).autoOrient().resize("600", "600").stream().pipe(
            writeStream);
        } else {
          readStream.pipe(writeStream);
        }
      }
    }), new FS.Store.GridFS("small", {
      chunkSize: 1 * 1024 * 1024,
      transformWrite: function (fileObj, readStream, writeStream) {
        if (gm.isAvailable) {
          gm(readStream).autoOrient().resize("235", "235" + "^").gravity("Center")
            .extent("235", "235").stream("PNG").pipe(writeStream);
        } else {
          readStream.pipe(writeStream);
        }
      }
    }), new FS.Store.GridFS("thumbnail", {
      chunkSize: 1 * 1024 * 1024,
      transformWrite: function (fileObj, readStream, writeStream) {
        if (gm.isAvailable) {
          gm(readStream).autoOrient().resize("100", "100" + "^").gravity("Center")
            .extent("100", "100").stream("PNG").pipe(writeStream);
        } else {
          readStream.pipe(writeStream);
        }
      }
    })
  ],
  filter: {
    allow: {
      contentTypes: ["image/*"]
    }
  }
});
