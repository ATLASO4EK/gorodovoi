import os, datetime, tempfile
from flask import request, jsonify, send_file
from src.API.app import app
from src.Database.admin.import_export import import_from_xlsx, export_to_xlsx

@app.route('/api/v1/admin/import-xlsx', methods=['POST'])
def importXLSX_api():
    if 'file' not in request.files: return jsonify({"ok": False, "error": "no file"}), 400
    f = request.files['file']
    if f.filename == '': return jsonify({"ok": False, "error": "empty filename"}), 400
    tmpdir = tempfile.mkdtemp()
    path = os.path.join(tmpdir, f.filename)
    f.save(path)
    try:
        summary = import_from_xlsx(path)
        return jsonify({"ok": True, "summary": summary}), 200
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 400

@app.route('/api/v1/admin/export-xlsx', methods=['GET'])
def exportXLSX_api():
    raw = request.args.get("sheets", "")
    sheets = [s.strip() for s in raw.split(",") if s.strip()] if raw else None

    tmpdir = tempfile.mkdtemp()
    out_path = os.path.join(tmpdir, "export.xlsx")
    result = export_to_xlsx(out_path, sheets=sheets)

    if not os.path.exists(out_path):
        return jsonify({"ok": False, "error": "export failed", "details": result}), 500

    return send_file(out_path, as_attachment=True, download_name="export.xlsx")
