var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

function searchPhotos(){
    let input_value = $("#input_box").val()
    if (!input_value.trim()) {
        $("#input_box").val("")
        $("#input_box").focus()
    } else {
        console.log("Search for: " + input_value)
        let query = input_value.trim()
        let apigClient = apigClientFactory.newClient({apiKey: "QnlHfCna0d8wJljf8AgcN6ACsQ1sYKmT2msSicjF"})
        let body = {}
        let params = {q: query};
        let addParams = {
            headers: {
            }
        }
        console.log(addParams)
        apigClient.searchGet(params, {}, addParams).then(function(response) {
            if (response.data.length == 0){
                console.log("no images found")
            } else {
                console.log("successful")
                console.log(response.data["images"])
                let results = response.data["images"]
                displaySearchResults(results)
            }
        })

        /*
        let data = {}
        fetch('https://dx1xq84dhi.execute-api.us-east-1.amazonaws.com/dev2/search?q=cat/', {
            method: 'GET', // or 'PUT'
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': "QnlHfCna0d8wJljf8AgcN6ACsQ1sYKmT2msSicjF"
            },
            
            })
            .then(response => response.json())
            .then(data => {
            console.log('Success:', data);
            })
            .catch((error) => {
            console.error('Error:', error);
            })
        */
        $("#input_box").focus()
    }
}


function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            let encoded = reader.result.toString().replace(/^data:(.*;base64,)?/, '');
            if ((encoded.length%4)>0) {
                encoded += '='.repeat(4 - (encoded.length % 4));
            }
            resolve(encoded);
        };
        reader.onerror = error => reject(error);
    })
}


function uploadNewPhoto(){
    let file = document.getElementById('image_file').files[0];
    let file_type = file['type']
    let labels = $("#image_labels").val().trim()
    console.log(labels)
    
    getBase64(file).then(data => {
        let apigClient = apigClientFactory.newClient({apiKey: "QnlHfCna0d8wJljf8AgcN6ACsQ1sYKmT2msSicjF"})
        let body = data
        let params = {"filename": file.name, "bucket": "photos-6998-hw2", "Content-Type": file_type + ";base64", "x-amz-meta-customLabels": labels}
        let addParams = {
            headers: {
            }
        } 

        apigClient.uploadBucketFilenamePut(params, body, addParams).then(function(response) {
            if (response.status == 200){
                $("#upload_info").html("Uploaded successfully!")
                console.log("uploaded")
            } else {
                console.log("couldn't upload")
            }
        })
    })
    
    
    
}


function startVoiceRecognition(){
    $("#start_button").disabled = true
    $("#start_button").html("Voice Recognition in Progress")

    let recognition = new SpeechRecognition()
    let speechRecognitionList = new SpeechGrammarList()
    recognition.grammars = speechRecognitionList
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.start();

    recognition.onresult = function(event) {
        let speechResult = event.results[0][0].transcript.toLowerCase();
        console.log(speechResult)
        console.log('Confidence: ' + event.results[0][0].confidence);
        $("#input_box").val(speechResult)
    }
    
    recognition.onspeechend = function() {
        recognition.stop()
        $("#start_button").disabled = false;
        $("#start_button").html("Use Voice Recognition")
    }

    recognition.onerror = function(event) {
        $("#start_button").disabled = false
        $("#start_button").html("Use Voice Recognition")
        console.log('Error occurred in recognition: ' + event.error)
    }

    recognition.onaudiostart = function(event) {
        //Fired when the user agent has started to capture audio.
        console.log('SpeechRecognition.onaudiostart');
    }
    
    recognition.onaudioend = function(event) {
        //Fired when the user agent has finished capturing audio.
        console.log('SpeechRecognition.onaudioend');
    }
    
    recognition.onend = function(event) {
        //Fired when the speech recognition service has disconnected.
        console.log('SpeechRecognition.onend');
    }
    
    recognition.onnomatch = function(event) {
        //Fired when the speech recognition service returns a final result with no significant recognition. This may involve some degree of recognition, which doesn't meet or exceed the confidence threshold.
        console.log('SpeechRecognition.onnomatch');
    }
    
    recognition.onsoundstart = function(event) {
        //Fired when any sound — recognisable speech or not — has been detected.
        console.log('SpeechRecognition.onsoundstart');
    }
    
    recognition.onsoundend = function(event) {
        //Fired when any sound — recognisable speech or not — has stopped being detected.
        console.log('SpeechRecognition.onsoundend');
    }
    
    recognition.onspeechstart = function (event) {
        //Fired when sound that is recognised by the speech recognition service as speech has been detected.
        console.log('SpeechRecognition.onspeechstart');
    }
    recognition.onstart = function(event) {
        //Fired when the speech recognition service has begun listening to incoming audio with intent to recognize grammars associated with the current SpeechRecognition.
        console.log('SpeechRecognition.onstart');
    }
}


function displaySearchResults(results) {
    $("#search_results_container").empty()

    if (results.length === 0) {
        let info = $("<div id='search_info'>"+"No images found"+"</div>")
        $("#search_results_container").append(info)
        console.log("No results found")
    } else {
        let info = $("<div id='search_info'>"+ results.length+ " image(s) found"+"</div>")
        $("#search_results_container").append(info)
    
        console.log("Found " + +results.length+ " result(s)")
    }

    let row = $("<div class= 'row'>")

    $.each(results, function(i, datum){
        console.log(datum)
        let col = $("<div class= 'col-md-4'>")
        let internal_row_1 = $("<div class= 'row centered'>")
        let name= $("<div class='listing'>")
        let name_text = datum
        $(name).html(name_text)
        $(internal_row_1).append(name)
        $(col).append(internal_row_1)
        
        let internal_row_2 = $("<div class= 'row centered'>")
        let image = $("<a>")
        $(image).append($('<img>',{src: "https://photos-6998-hw2.s3.amazonaws.com/" + datum, border: 0, width: 300}))
        $(internal_row_2).append(image)
        $(col).append(internal_row_2)
        
        $(row).append(col)
    })

    $("#search_results_container").append(row)

}


function readURL(input) {
    console.log("before if")
    console.log(input.files)
    console.log(input.files[0])
    if (input.files && input.files[0]) {
        console.log("inside if ")
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#imageResult')
                .attr('src', e.target.result);
        };
        reader.readAsDataURL(input.files[0]);
    }
}


$(document).ready(function(){                       
    
    $("#search_button").click(function(event){
        $("#upload_info").empty()
        console.log("search button clicked")        
        searchPhotos()
        event.preventDefault();
    })

    $("#start_button").click(function(event){
        $("#upload_info").empty()     
        console.log("voice recognition button clicked")        
        startVoiceRecognition()
        event.preventDefault();
    })

    $("#image_file").change(function(event){
        $("#upload_info").empty()     
        console.log(event.target.files[0])
        $("#frame").attr("src", URL.createObjectURL(event.target.files[0]))
    })

    $("#upload_button").click(function(event){
        $("#upload_info").empty()     
        console.log("upload button clicked")
        uploadNewPhoto()
        $('#image_file').val('')
        $("#frame").attr("src", '')
        event.preventDefault()
    })
    
    $("#input_box").keypress(function(event){
        $("#upload_info").empty()     
        if(event.which == 13) {
            console.log("search button clicked")
            searchPhotos()
            event.preventDefault();
        }   
    })

})