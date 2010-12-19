CHROME = /opt/google/chrome/google-chrome

TEST_HOME = spec/index.html

test:
	@$(CHROME) $(shell pwd)/$(TEST_HOME)?v=$(shell date +%s)
