
exports.bb = {
    out: "lib/xui-bb",
    include: [
        "src/header",
        "src/base",
        "src/js/dom",
        "src/js/event",
        "src/js/fx",
        "src/js/style",
        "src/js/xhr",
        "packages/emile/emile",
        "packages/sizzle/sizzle",
        "packages/domready/ready",
        "src/footer"
    ]
}

exports.core = {
    out: "lib/xui",
    include: [
        "src/header",
        "src/base",
        "src/js/dom",
        "src/js/event",
        "src/js/fx",
        "src/js/style",
        "src/js/xhr",
        "packages/emile/emile",
        "packages/domready/ready",
        "src/footer"
    ]
}

exports.ie = {
    out: "lib/xui-ie",
    include: [
        "src/header",
        "src/base",
        "src/js/fx",
        "src/js/xhr",
        "src/IE/dom",
        "src/IE/event",
        "src/IE/style",
        "packages/emile/emile",
        "packages/sizzle/sizzle",
        "packages/split/split",
        "packages/domready/ready",
        "src/footer"
    ]
}