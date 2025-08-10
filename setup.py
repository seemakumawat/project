from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

with open("requirements.txt", "r", encoding="utf-8") as fh:
    requirements = [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="eduface-ai",
    version="1.0.0",
    author="EduFace AI Team",
    author_email="contact@eduface-ai.com",
    description="Face Recognition Attendance System for Educational Institutions",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/eduface-ai/face-recognition-attendance",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Education",
        "Topic :: Education",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
        "Topic :: Scientific/Engineering :: Image Recognition",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.7",
    install_requires=requirements,
    entry_points={
        "console_scripts": [
            "eduface-ai=main:main",
        ],
    },
    include_package_data=True,
    package_data={
        "": ["*.txt", "*.md", "*.yml", "*.yaml"],
    },
    keywords="face-recognition attendance education ai machine-learning opencv tensorflow",
    project_urls={
        "Bug Reports": "https://github.com/eduface-ai/face-recognition-attendance/issues",
        "Source": "https://github.com/eduface-ai/face-recognition-attendance",
        "Documentation": "https://github.com/eduface-ai/face-recognition-attendance/wiki",
    },
)