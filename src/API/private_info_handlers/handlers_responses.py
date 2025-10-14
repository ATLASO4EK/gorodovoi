import datetime
from flask import request, jsonify
from src.API.app import app


from src.Database.responses.DB_vacancy import post_vac_resp
from src.Database.responses.DB_services import post_service_resp

@app.route('/api/v1/vacancy_resp', methods=['POST'])
def post_vac_resp_api():
    try:
        full_name = str(request.args.get('full_name'))
        email = str(request.args.get('email'))
        phone = str(request.args.get('phone'))
        job_exp = str(request.args.get('job_exp'))
        dt = datetime.datetime.now()
        desired_vacancy = str(request.args.get('des_vac')) if request.args.get('des_vac') is not None else None
        add_info = str(request.args.get('add_info')) if request.args.get('add_info') is not None else None
        ischecked = bool(request.args.get('ischecked')) if request.args.get('ischecked') is not None else False
    except Exception as e:
        return jsonify(str(e)), 400

    try:
        suc, error = post_vac_resp(full_name=full_name,
                            email=email,
                            phone=phone,
                            job_exp=job_exp,
                            datetime=dt,
                            desired_vacancy=desired_vacancy,
                            add_info=add_info,
                            ischecked=ischecked)
        if suc is True:
            return jsonify(suc), 200
        elif suc is False:
            return jsonify(str(error)), 500
        else:
            return jsonify('Unexpected error has occurred'), 500
    except Exception as e:
        return jsonify(str(e)), 500

@app.route('/api/v1/service_resp', methods=['POST'])
def post_service_resp_api():
    try:
        full_name = str(request.args.get('full_name'))
        email = str(request.args.get('email'))
        phone = str(request.args.get('phone'))
        service = str(request.args.get('service'))
        dt = datetime.datetime.now()
        add_info = str(request.args.get('add_info')) if request.args.get('add_info') is not None else None
        ischecked = bool(request.args.get('ischecked')) if request.args.get('ischecked') is not None else False
    except Exception as e:
        return jsonify(str(e)), 400

    try:
        suc, error = post_service_resp(full_name=full_name,
                                email=email,
                                phone=phone,
                                service=service,
                                datetime=dt,
                                add_info=add_info,
                                ischecked=ischecked)
        if suc is True:
            return jsonify(suc), 200
        elif suc is False:
            return jsonify(str(error)), 500
        else:
            return jsonify('Unexpected error has occured'), 500
    except Exception as e:
        return jsonify(str(e)), 500