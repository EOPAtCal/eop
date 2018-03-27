const smartScriptFetch = path => {
  let scripts = Array.from(document.querySelectorAll("script")).map(
    scr => scr.src
  );

  if (!scripts.includes(path)) {
    var tag = document.createElement("script");
    tag.src = path;
    document.getElementsByTagName("body")[0].appendChild(tag);
  }
};
