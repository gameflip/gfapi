#!/usr/bin/env ruby

# **Generates authorization header to login to Gameflip API**
#
# 1. Get your Gameflip API Key and TOTP secret:
# ```
# https://gameflip.com/settings
# ```
#
# 2. Add the API key and secret to your IDE environment or `~/.bash_profile`:
# ```bash
# export GFAPI_KEY=my_api_key
# export GFAPI_SECRET=my_api_secret
# ```
#
# 3. Sample API call to get your profile
# ```bash
# export API="https://production-gameflip.fingershock.com/api/v1"
# curl -isS -H "$(ruby authorization_ruby.rb)" -X GET "${API}/account/me/profile"; echo
# ```

require 'rotp'

totp = ROTP::TOTP.new(ENV['GFAPI_SECRET'], digits: 6, digest: 'sha1', interval: 30)
puts("Authorization: GFAPI #{ENV['GFAPI_KEY']}:#{totp.now}")
