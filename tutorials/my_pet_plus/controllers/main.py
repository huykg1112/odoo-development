import odoo
import odoo.http as http
import logging
import json
from odoo.addons.my_pet.controllers.main import MyPetController

_logger = logging.getLogger(__name__) # đây là cách để tạo một logger trong Odoo, giúp bạn ghi lại các thông tin, cảnh báo hoặc lỗi trong quá trình phát triển module của mình. Bạn có thể sử dụng _logger để ghi lại các thông điệp quan trọng trong mã của bạn, giúp bạn dễ dàng theo dõi và gỡ lỗi khi cần thiết.

class MyPetAPIInherit(MyPetController):

    @odoo.http.route('/foo', auth='public')
    def foo_handler(self):
        return "New 'foo' API!"

    @odoo.http.route('/bar2', auth='public')
    def bar_handler(self):
        return json.dumps({
            "content": "New 'bar' API2!"
        })

    @odoo.http.route()
    def pet_page(self, dbname, id, **kw):
        _logger.warning("Pet handler called~")
        result = super(MyPetAPIInherit, self).pet_page(dbname, id)
        _logger.warning("Post processing~")
        return result

    @odoo.http.route(['/pet-plus/<dbname>/<id>'], type='http', auth="none", sitemap=False, cors='*', csrf=False)
    def pet_plus_page(self, dbname, id, **kwargs):
        model_name = "product.pet"
        try:
            registry = odoo.modules.registry.Registry(dbname)
            with registry.cursor() as cr:
                env = odoo.api.Environment(cr, odoo.SUPERUSER_ID, {})
                rec = env[model_name].search([('id', '=', int(id))], limit=1)
                
                if not rec:
                    response = {
                        "status": "error",
                        "content": "Pet not found"
                    }
                else:
                    response = rec.read()[0]  # Đọc tất cả các trường của bản ghi và lấy phần tử đầu tiên (vì search có thể trả về nhiều bản ghi)
        except Exception as e:
            _logger.error(f"Error in pet_page API: {str(e)}")  # Log lỗi để debug
            response = {
                "status": "error",
                "content": f"Error: {str(e)}"
            }
        return json.dumps(response, default=str)