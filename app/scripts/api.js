import $ from 'jquery'

export default class EmojitApi {
    constructor(url) {
        this.url = url || 'https://api.emojit.site'
    }

    deleteUser(request) {
        return $.ajax({
            method: 'DELETE',
            dataType: 'json',
            contentType: 'application/json',
            url: `${this.url}/user`,
            data: JSON.stringify(request),
            success: function (response) {
                console.debug("Delete response:", response)
                return response
            },
            error: function (error) {
                console.error("Error deleting user.", error.status, error.responseJSON)
            }
        })
    }
}