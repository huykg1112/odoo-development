from odoo import http # dùng để định nghĩa controller, http.Controller là class cha của controller
from odoo.http import request, route # request là đối tượng chứa thông tin request, route là decorator để định nghĩa route

class OwlPlayground(http.Controller): # kế thừa http.Controller
    @http.route(['/awesome_owl'], type='http', auth='public') 
    # /awesome_owl là URL của route
    # type='http' là http request, các loại type khác là 'json' (trả về json), 'websocket' (websocket)
    # auth='public' là public access, các loại auth khác là 'user' (user access), 'admin' (admin access)
    def show_playground(self): # định nghĩa phương thức show_playground, self là tham số bắt buộc của phương thức, dùng để truy cập request, route, session, ...
        """
        Renders the owl playground page
        """
        return request.render('awesome_owl.playground')
        # 'awesome_owl.playground' là tên của template, được định nghĩa trong file 'views/templates.xml'
        # 'awesome_owl' là tên của module, 'playground' là tên của template
