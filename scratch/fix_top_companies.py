import os

directory = r'c:\Users\NagaarjunBushuGovind\Downloads\EasyJobs_Project (1)\frontend\pages\top-companies'

for filename in os.listdir(directory):
    if filename.endswith('.html'):
        path = os.path.join(directory, filename)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace absolute links with relative ones
        new_content = content.replace('/frontend/pages/', '../')
        
        # Fix broken script tags
        new_content = new_content.replace('<script ../../javascript/', '<script src="../../javascript/')
        
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Updated {filename}')
