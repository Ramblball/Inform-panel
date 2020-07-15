class Media {
    constructor(name) {
        this._baseUrl = name;
    }

    getData() {
        const request = async () => {
            const response = await fetch(`/${this._baseUrl}`)
                .catch(er => { throw er });
            return await response.json();
        }
        return request();
    }

    create(data, header) {
        return this.change(data, header, 'POST', 'create');
    }

    update(data, header) {
        return this.change(data, header, 'PUT', 'update', { id: data._id });
    }

    remove(data, header) {
        return this.change(data, header, 'DELETE', 'remove', { id: data._id });
    }

    change(data, header, method, action, params = null) {
        const request = async (data, header, method, action, params) => {
            let url = new URL(`/${this._baseUrl}/${action}`);
            if (params !==  null)
                url.search = new URLSearchParams(params);
            const response = await fetch(url,
                {
                    method: method,
                    headers: header,
                    data: JSON.stringify(data)
                })
                .catch(er => { throw er });
            return await response.json();
        }
        return request(data, header, method, action, params);
    }
}

class Album  extends Media{
    constructor(name) {
        super(name);
    }

    get Albums() {
        return this.getData();
    }
}