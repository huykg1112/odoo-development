import odoo
import odoo.http as http
import logging
import json

_logger = logging.getLogger(__name__) # đây là cách để tạo một logger trong Odoo, giúp bạn ghi lại các thông tin, cảnh báo hoặc lỗi trong quá trình phát triển module của mình. Bạn có thể sử dụng _logger để ghi lại các thông điệp quan trọng trong mã của bạn, giúp bạn dễ dàng theo dõi và gỡ lỗi khi cần thiết.

class MyPetController(http.Controller):

    @http.route('/foo', auth='public')
    def hello(self, **kwargs):
        _logger.info("Hello from My Pet Controller!") # ghi lại một thông điệp thông tin khi route này được truy cập
        return "Hello, welcome to My Pet module!"

    @http.route('/foo/bar', auth='public')
    def bar(self, **kwargs):
        _logger.info("Bar route accessed!") # ghi lại một thông điệp thông tin khi route này được truy cập
        return "This is the bar route in My Pet module!"

    # API lấy data detail pet
    @http.route('/api/pet/<int:pet_id>', auth='public', type='http')
    def get_pet_detail(self, pet_id, **kwargs):
        _logger.info(f"API called to get details for pet ID: {pet_id}") # ghi lại một thông điệp thông tin khi API này được gọi
        Pet = http.request.env['my.pet'].sudo() # truy cập model my.pet với quyền sudo để đảm bảo có thể đọc dữ liệu
        pet = Pet.search([('id', '=', pet_id)], limit=1) # tìm kiếm pet theo ID
        if pet:
            response = {
                'id': pet.id,
                'name': pet.name,
                'age': pet.age,
                'gender': pet.gender,
                'nickname': pet.nickname,
            }
        else:
            response = {'error': 'Pet not found'}
        return http.Response(json.dumps(response), content_type='application/json')

    # ví dụ call API: http://localhost:8069/api/pet/1
        
    @odoo.http.route(['/pet/<dbname>/<id>'], type='http', auth="none", sitemap=False, cors='*', csrf=False)
    def pet_page(self, dbname, id, **kwargs):
        model_name = "my.pet"
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
                    # Handle null dob
                    dob_str = rec.dob.strftime('%d/%m/%Y') if rec.dob else 'N/A'
                    
                    response = {
                        "status": "ok",
                        "content": {
                            "name": rec.name,
                            "nickname": rec.nickname,
                            "description": rec.description,
                            "age": rec.age,
                            "weight": rec.weight,
                            "dob": dob_str,
                            "gender": rec.gender,
                        }
                    }
        except Exception as e:
            _logger.error(f"Error in pet_page API: {str(e)}")  # Log lỗi để debug
            response = {
                "status": "error",
                "content": f"Error: {str(e)}"
            }
        return json.dumps(response)

# ví dụ call API: http://localhost:8069/pet/my_db/1
    