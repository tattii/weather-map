deploy:
	gcloud functions deploy jma-xml-weather-map \
		--project weatherbox-217409 \
		--region asia-northeast1 \
		--trigger-topic jma-xml-weather-map \
		--runtime nodejs8 \
		--entry-point handler
