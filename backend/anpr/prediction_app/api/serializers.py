from rest_framework import serializers

class ImageSerializer(serializers.Serializer):
    photo = serializers.ImageField()