
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('workforce/', include('workforce.urls')),
    path('', include('workforce.urls')),  # Make it the default page
]
