let file = document.getElementById("file");
let Main_input_file_name = document.getElementById("Main_input_file_name");
let Zip_extracting_Done = document.querySelector(".Zip_extracting_Done");

function downloadZips() {
  for (const prop in blobzipList) {
    if (prop.includes(".")) {
      saveAs(blobzipList[prop], prop);
    }
  }
}

function RefreshZipHandler() {
  location.reload();
  document.getElementById("upload-icon-section").style.display = "block";
  document.querySelector(".zip-download-button").style.display = "none";
  extracted.style.display = "none";
  Main_input_file_name.style.display = "none";
}

document.getElementById("zip_file").addEventListener("click", function () {
  file.click();
});

let blobzipList = {};
let extracted = document.getElementById("extracted");
zip.workerScriptsPath = "/";
function ZipfileHandler() {
  let input_File = file.files[0].name;
  Main_input_file_name.innerText = input_File;
  var extantion = input_File.split(".").pop();
  if (extantion == "zip") {
    zip.createReader(
      new zip.BlobReader(file.files[0]),
      function (reader) {
        debugger;
        reader.getEntries(function (entries) {
          extracted.style.display = "block";
          Main_input_file_name.style.display = "block";
          document.getElementById("upload-icon-section").style.display = "none";
          document.querySelector(".zip-download-button").style.display =
            "block";
          zipArray = [];
          for (i = 0; i < entries.length; i++) {
            var filename = entries[i].filename;
            var path = filename.split("/");
            var len = path.length;
            if (path[len - 1]) {
              var c = setJsTree(path, zipArray, filename);
              zipArray = c;
            }
          }
          $("#extracted").jstree({
            core: {
              data: zipArray,
            },
          });
          entries.map(async (entry) => {
            await entry.getData(
              new zip.BlobWriter(),
              function (extractedFileBlob) {
                blobzipList[entry.zipname] = extractedFileBlob;
              }
            );
          });

          $("#extracted")
            .on("changed.jstree", function (e, obj) {
              if (!obj.node.data.dir) {
                const file = blobzipList[obj.node.data.zip1name];
                saveAs(file, obj.node.text);
              }
            })
            .jstree();
        });
        alert("Zip  successfully extracted");
      },
      function (error) {
        console.log("error");
      }
    );
  } else {
    alert("You can upload only zip files");
  }
}
function setJsTree(path, zipfiletree, zipName) {
  for (var i = 0; i < path.length; i++) {
    var objFound = zipfiletree.find((obj) => {
      return obj.text === path[0];
    });
    if (objFound === undefined) {
      zipfiletree.push({
        text: path[0],
        state: { opened: i === path.length - 1 ? true : false },
        data: {
          dir: i === path.length - 1 ? false : true,
          zipname: i === path.length - 1 ? zipName : "",
        },
        icon:
          i === path.length - 1
            ? "https://img.icons8.com/material-rounded/24/fa314a/folder-invoices.png"
            : "https://img.icons8.com/material-rounded/24/fa314a/folder-invoices.png",
        children: [],
      });
    } else {
      setJsTree(path.slice(1), objFound.children, zipName);
    }
  }
  //<img src="https://img.icons8.com/material-rounded/50/fa314a/file--v1.png"/>
  return zipfiletree;
}
