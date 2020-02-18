
function buscaTopico(valor, pagina) {
    var size = $("#size").val();
    postApi({ "page": 0, "busca": valor, "size": size }, 0, 0, pagina);
}

function mudaSize(pagina) {
    var page = $(this).attr('data-page');
    var busca = $("#busca").val();
    var size = $("#size").val();
    var data;
    if (busca != null) {
        data = { page: page, busca: busca, size: size };
    } else {
        data = { page: page, size: size };
    }
    postApi({ "page": 0, "busca": busca, "size": size }, 0, 0, pagina);
}

function postApiPosterior(data, page, pageAnterior, pagina) {
    
    $.post('list', data).done(function (response) {
        var tr = "";
        response.itens.forEach(function (data) {
            var background = "";
            var status;
            if (data.status == true) {
                status = 'Ativo';
            } else {
                status = 'Inativo';
            }
            
            tr += '<tr>' +
                '<td>' + data.ordenacao + '</td>' +
                '<td>' + data.titulo + '</td>' +
                '<td>' + data.cidade.nome + '</td>' +
                '<td>' + status + '</td>' +
                '<td>' +
                '<a href="/app/'+pagina+'/edit/' + data.id + '" class="btn btn-warning btn-circle btn-sm" data-toggle="tooltip" data-placement="left" title="Editar">' +
                '<i class="fas fa-edit"></i>' + '</a> ' +
                '<a href="#" class="btn btn-danger btn-circle btn-sm" data-toggle="modal"' +
                'data-target="#logoutModal"' +
                'onclick="setaDadosModal(' + data.id + ')">' +
                '<i class="far fa-trash-alt"></i>' +
                '</a>' +
                '</td>' +
                '</tr>';
        });

        $('#table_body').html(tr);
        var number = response.number + 1;
        var tpages = response.totalPages;
        var pagenumber = number + ' de ' + tpages;
        $('#page-number').html(pagenumber);

        if (number < response.totalPages) {
            $("#page-posterior").attr('data-page', parseInt(response.number) + 1);
            $("#page-anterior").attr('data-page', parseInt(pageAnterior) + 1).removeClass('disabled');
        } else {
            $("#page-anterior").attr('data-page', parseInt(pageAnterior) + 1).removeClass('disabled');
            $("#page-posterior").addClass('disabled');
        }

    })
}

function postApiAnterior(data, pageAnterior, pagePosterior, pagina) {
    $.post('list', data).done(function (response) {

        var tr = "";

        response.itens.forEach(function (data) {
            var background = "";

            var status;
            if (data.status == true) {
                status = 'Ativo';
            } else {
                status = 'Inativo';
            }
            
            tr += '<tr>' +
                '<td>' + data.ordenacao + '</td>' +
                '<td>' + data.titulo + '</td>' +
                '<td>' + data.cidade.nome + '</td>' +
                '<td>' + status + '</td>' +
                '<td>' +
                '<a href="/app/'+pagina+'/edit/' + data.id + '" class="btn btn-warning btn-circle btn-sm" data-toggle="tooltip" data-placement="left" title="Editar">' +
                '<i class="fas fa-edit"></i>' + '</a> ' +
                '<a href="#" class="btn btn-danger btn-circle btn-sm" data-toggle="modal"' +
                'data-target="#logoutModal"' +
                'onclick="setaDadosModal(' + data.id + ')">' +
                '<i class="far fa-trash-alt"></i>' +
                '</a>' +
                '</td>' +
                '</tr>';
        });

        $('#table_body').html(tr);
        var tpages = response.totalPages;
        var pagenumber = pageAnterior + ' de ' + tpages;
        $('#page-number').html(pagenumber);

        $("#page-posterior").removeClass('disabled');
        if (pageAnterior == 1) {
            $("#page-anterior").attr('data-page', parseInt(pageAnterior) - 1).addClass('disabled');
            $("#page-link-anterior").addClass('disabled');
        } else {
            $("#page-anterior").attr('data-page', parseInt(pageAnterior) - 1);
        }

        $("#page-posterior").attr('data-page', parseInt(pagePosterior) - 1);

    });
}

function postApi(json, page, pageAnterior, pagina) {
    $.post('list', json).done(function (response) {
        var tr = "";

        response.itens.forEach(function (data) {
            var background = "";

            var status;
            if (data.status == true) {
                status = 'Ativo';
            } else {
                status = 'Inativo';
            }
            
            tr += '<tr>' +
                '<td>' + data.ordenacao + '</td>' +
                '<td>' + data.titulo + '</td>' +
                '<td>' + data.cidade.nome + '</td>' +
                '<td>' + status + '</td>' +
                '<td>' +
                '<a href="/app/'+pagina+'/edit/' + data.id + '" class="btn btn-warning btn-circle btn-sm">' +
                '<i class="fas fa-edit"></i>' + '</a> ' +
                '<a href="#" class="btn btn-danger btn-circle btn-sm" data-toggle="modal"' +
                'data-target="#logoutModal"' +
                'onclick="setaDadosModal(' + data.id + ')">' +
                '<i class="far fa-trash-alt"></i>' +
                '</a>' +
                '</td>' +
                '</tr>';
        });

        $('#table_body').html(tr);
        var number = response.number + 1;
        var tpages = response.totalPages;
        var pagenumber = number + ' de ' + tpages;
        $('#page-number').html(pagenumber);
        $("#page-anterior").addClass('disabled');

        if (number == response.totalPages) {
            $("#page-posterior").attr('data-page', 0);
            $("#page-posterior").addClass('disabled');
        } else {
            $("#page-posterior").attr('data-page', parseInt(response.number) + 1);
            $("#page-posterior").removeClass('disabled');
        }

    })
}