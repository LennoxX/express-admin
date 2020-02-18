let area = [  
    { field: "id", header: "Id", type: String },
    { field: "descricao", header: "Descricao", type: String },
    { field: "nome", header: "Nome", type: String },
    { field: "acessivel", header: "acessivel", type: Boolean },
];

module.exports.area = area;

/*

<table class="table table-bordered" id="dataTable" width="100%" cellspacing="0">
							<% itens.forEach(iten => { %>
							<tr>
								<%  Object.keys(iten).forEach(key => { %>
								<td><%= iten[key] %> </td>
								<% }) %>
							</tr>
							<% }) %>

						</table>
*/