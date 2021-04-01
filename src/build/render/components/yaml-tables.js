const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");
const {anchor, html, slugify} = require("./bits");

function renderTableYaml(ctx, optsYaml) {
  const {renderMarkdown} = require("./markdown"); //todo: untangle circular dep

  const opts = yaml.load(optsYaml);

  if (!opts.tableDefs)
    throw new Error("Missing table value: tableDefs");

  if (!opts.tableName)
    throw new Error("Missing table value: tableName");

  const data = yaml.load(
    fs.readFileSync(path.join(ctx.page.dirPath, opts.tableDefs), "utf8")
  )[opts.tableName];

  // De-duplicate common YAML error message stuff
  function YamlError(reason) {
    return new Error(`Malformed table YAML. Table ${opts.tableName} ${reason}`);
  }

  if (!data)
    throw YamlError('not found');

  if (!data.columns)
    throw YamlError('missing entry: columns');

  if (!data.rows)
    throw YamlError('missing entry: rows');

  data.columns.reduce((seenKeys, col) => {
    if (seenKeys[col.key])
      throw YamlError(`duplicate key: ${col.key}`);

    seenKeys[col.key] = true;
    return seenKeys;
  }, {});

  // Converts the given content to HTML. content can be a string, or an object
  // containing both english and spanish strings. format can be used to add
  // additional markdown formatting without actually needing to have it in the
  // content itself.
  function markdownToHtml(format, content) {
    if (typeof format !== "string")
      throw YamlError(
        `invalid column format datatype: ${typeof format}. Must be string`);

    // Generates an empty table cell if content is omitted
    if (!content)
      return '';

    // Select a translation if we have one, or default to english
    const translated = typeof content === "object" ?
      content[ctx.lang] || content['en'] : content;

    if (format === "text") {
      return renderMarkdown(ctx, translated);
    } else if (format === "code") {
      return renderMarkdown(ctx, "`" + translated + "`");
    } else if (format.startsWith("codeblock")) {
      const syntax = format.split("-")[1]; // Could be undef. That's ok.
      return renderMarkdown(ctx, "```" + syntax + "\n" + translated + "\n```");
    } // Could implement others here
    else {
      throw YamlError(`unsupported column format: ${format}`);
    }
  }

  // Insert a column that will contain a link for each row, if needed
  if (opts.rowLinks) {
    data.columns.unshift({
      key: "__link",
      name: {
        en: "",
        es: "",
      },
      format: "text",
    });
  }

  // Create a link slug, prioritizing row slug override, then table column key
  // setting, then falling back to index if no others are provided.
  function id(row, index) {
    return slugify(`${opts.tableName}-${row.slug || row[data.slugKey] || index}`);
  }

  return html`
    <table>
      <thead>
        <tr>
        ${ data.columns.map(col =>
          html`<th style="${col.style}">${ markdownToHtml('text', col.name) }</th>`
        ) }
        </tr>
      </thead>
      <tbody>
        ${ data.rows.map((row, index) =>
          html`<tr id="${opts.rowLinks && id(row, index)}">${ data.columns.map(col =>
            html`<td style="${col.style}">${
              col.key === "__link" ?
                anchor("#" + id(row, index), "#") :
                markdownToHtml(col.format, row[col.key])
            }</td>`
          ) }</tr>`
        ) }
      </tbody>
    </table>
  `;
}

module.exports = {renderTableYaml};
